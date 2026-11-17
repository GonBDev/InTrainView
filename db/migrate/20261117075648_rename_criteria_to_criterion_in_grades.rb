class RenameCriteriaToCriterionInGrades < ActiveRecord::Migration[8.1]
  def change
    rename_column :grades, :criteria, :criterion
  end
end
