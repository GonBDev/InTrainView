class CreateTrainings < ActiveRecord::Migration[8.1]
  def change
    create_table :trainings do |t|
      t.string :challenge_type
      t.string :target_job
      t.string :job_description
      t.string :status
      t.string :summary
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
