class AddTimerToChats < ActiveRecord::Migration[8.1]
  def change
    # Seconds left when the timer is stopped (paused or finished)
    add_column :chats, :remaining_seconds, :integer, null: false, default: 900
    # Set while the timer is running, empty while it is paused
    add_column :chats, :timer_started_at, :datetime
  end
end
