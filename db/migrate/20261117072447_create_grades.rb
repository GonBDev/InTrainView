class CreateGrades < ActiveRecord::Migration[8.1]
  def change
    create_table :grades do |t|
      t.references :chat, null: false, foreign_key: true
      t.string :criteria
      t.integer :score
      t.text :advice

      t.timestamps
    end
  end
end
