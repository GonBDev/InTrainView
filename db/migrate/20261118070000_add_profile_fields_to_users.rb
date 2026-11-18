class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :country, :string unless column_exists?(:users, :country)
    add_column :users, :birthday, :date unless column_exists?(:users, :birthday)
    add_column :users, :industry, :string unless column_exists?(:users, :industry)
    add_column :users, :job_title, :string unless column_exists?(:users, :job_title)
    add_column :users, :experience, :string unless column_exists?(:users, :experience)
    add_column :users, :skills, :string unless column_exists?(:users, :skills)
    add_column :users, :bio, :text unless column_exists?(:users, :bio)
  end
end
