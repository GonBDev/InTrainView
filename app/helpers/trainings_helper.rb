# Small helpers for the trainings pages and the practice feedback.
module TrainingsHelper
  def challenge_kind(type)
    type == "negotiation" ? "negotiation" : "interview"
  end

  def challenge_label(type)
    type == "negotiation" ? "Salary negotiation" : "Job interview"
  end

  # { "Clarity" => 7, "Tone" => nil, ... } in the order of the criteria of the training
  def chat_scores(chat)
    by_criterion = chat.grades.index_by(&:criterion)
    Grade::CRITERIA.fetch(chat.training.challenge_type).index_with { |name| by_criterion[name]&.score }
  end

  # Average of the scored criteria, or nil when the practice is not graded
  def chat_average(chat)
    scores = chat_scores(chat).values.compact
    scores.sum.fdiv(scores.size).round(1) if scores.any?
  end

  # Colour family of a score: blue (strong), orange (average), red (weak), none
  def score_tone(score)
    return "none" if score.nil?

    if score < 5
      "low"
    elsif score < 7
      "mid"
    else
      "high"
    end
  end

  def format_score(score)
    score.nil? ? "n/a" : number_with_precision(score, precision: 1, strip_insignificant_zeros: true)
  end

  # Numbers shown on a training card and on the training page
  def training_stats(training)
    chats = training.chats.to_a
    averages = chats.filter_map { |chat| chat_average(chat) }

    {
      practices: chats.size,
      last: chats.map(&:created_at).max,
      best: averages.max,
      average: averages.any? ? averages.sum.fdiv(averages.size).round(1) : nil,
      answers: chats.sum { |chat| chat.messages.count { |message| message.role == "user" } }
    }
  end

  def verdict_for(average)
    return "Not enough answers to score yet" if average.nil?

    if average >= 8
      "Strong answers overall"
    elsif average >= 6
      "A good base, with a few gaps to close"
    else
      "Keep practicing, the advice below will help"
    end
  end
end
