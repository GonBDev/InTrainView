module ChatsHelper
  # Name of the AI character, shown on its messages
  def ai_name_for(chat)
    chat.training.challenge_type == "negotiation" ? "Manager" : "Interviewer"
  end

  # 905 -> "15:05"
  def format_clock(seconds)
    seconds = seconds.to_i
    format("%d:%02d", seconds / 60, seconds % 60)
  end

  # Colour state of the timer: ok, warn (3 min left), danger (1 min left), paused
  def timer_state(chat)
    return "paused" if chat.paused?

    left = chat.seconds_left
    if left <= 60 then "danger"
    elsif left <= 180 then "warn"
    else "ok"
    end
  end
end
