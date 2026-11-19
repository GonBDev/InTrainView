# Time limit of a practice: 15 minutes that can be paused.
#
# Two columns keep the state:
#   remaining_seconds  seconds left when the timer is stopped
#   timer_started_at   when the timer last started, empty while paused
module ChatTimer
  extend ActiveSupport::Concern

  LIMIT = 15 * 60

  included do
    before_create :start_timer
  end

  def in_progress?
    status == "in_progress"
  end

  def paused?
    in_progress? && timer_started_at.nil?
  end

  def timer_running?
    in_progress? && timer_started_at.present?
  end

  def seconds_left
    return remaining_seconds if timer_started_at.nil?

    [remaining_seconds - (Time.current - timer_started_at).to_i, 0].max
  end

  def time_up?
    in_progress? && timer_started_at.present? && seconds_left.zero?
  end

  # Seconds spent, or nil for practices made before the timer existed
  def time_used
    return if in_progress? || remaining_seconds == LIMIT

    LIMIT - remaining_seconds
  end

  def pause_timer!
    with_lock do
      next unless timer_running? && seconds_left.positive?

      update!(remaining_seconds: seconds_left, timer_started_at: nil)
    end
  end

  def resume_timer!
    with_lock do
      next unless paused? && remaining_seconds.positive?

      update!(timer_started_at: Time.current)
    end
  end

  # Keeps the time left once the practice is finished
  def stop_timer!
    update!(remaining_seconds: seconds_left, timer_started_at: nil)
  end

  private

  def start_timer
    self.remaining_seconds = LIMIT
    self.timer_started_at = Time.current
  end
end
