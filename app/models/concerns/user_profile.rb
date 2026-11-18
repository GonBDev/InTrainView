# Profile data of a user: used by the profile page and, later, by the AI prompt.
module UserProfile
  extend ActiveSupport::Concern

  MAX_SKILLS = 15
  MAX_AVATAR_SIZE = 5.megabytes
  AVATAR_TYPES = %w[image/jpeg image/png image/webp image/gif].freeze
  # Fields counted in the completion bar (the photo counts too)
  COMPLETION_FIELDS = %i[country birthday industry job_title experience skills bio].freeze

  included do
    has_one_attached :avatar

    before_validation :clean_skills

    validates :country, inclusion: { in: ProfileOptions::COUNTRIES }, allow_blank: true
    validates :industry, inclusion: { in: ProfileOptions::INDUSTRIES }, allow_blank: true
    validates :experience, inclusion: { in: ProfileOptions::EXPERIENCES }, allow_blank: true
    validates :job_title, length: { maximum: 80 }
    validates :bio, length: { maximum: 500 }
    validate :birthday_is_realistic
    validate :avatar_is_a_small_image
  end

  def skill_list
    skills.to_s.split(",").map(&:strip).reject(&:blank?).uniq.first(MAX_SKILLS)
  end

  # Percentage of the profile that is filled in (0 to 100)
  def profile_completion
    filled = COMPLETION_FIELDS.count { |field| self[field].present? }
    filled += 1 if avatar.attached?
    (filled * 100.0 / (COMPLETION_FIELDS.size + 1)).round
  end

  # Short text describing the user. Add it to the instructions you send to the AI.
  def profile_context
    lines = []
    lines << "Country: #{country}" if country.present?
    lines << "Age: #{age}" if age
    lines << "Industry: #{industry}" if industry.present?
    lines << "Current or target job title: #{job_title}" if job_title.present?
    lines << "Years of experience: #{experience}" if experience.present?
    lines << "Skills: #{skill_list.join(', ')}" if skill_list.any?
    lines << "About them: #{bio}" if bio.present?
    lines.join("\n")
  end

  def age
    return if birthday.blank?

    today = Date.current
    years = today.year - birthday.year
    years -= 1 if today < birthday + years.years
    years
  end

  private

  def clean_skills
    self.skills = skill_list.join(", ")
  end

  def birthday_is_realistic
    return if birthday.blank?

    errors.add(:birthday, "must be in the past") if birthday >= Date.current
    errors.add(:birthday, "is not realistic") if birthday < Date.new(1900, 1, 1)
  end

  def avatar_is_a_small_image
    return unless avatar.attached?

    errors.add(:avatar, "must be a JPG, PNG, WebP or GIF image") unless AVATAR_TYPES.include?(avatar.blob.content_type)
    errors.add(:avatar, "must be smaller than 5 MB") if avatar.blob.byte_size > MAX_AVATAR_SIZE
  end
end
