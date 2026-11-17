class CreateChats < ActiveRecord::Migration[8.1]
  def change
    create_table :chats do |t|
      t.references :training, null: false, foreign_key: true
      t.text :summary
      t.text :description
      t.string :status

      t.timestamps
    end
  end
end
