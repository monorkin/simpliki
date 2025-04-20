class AddFullTextSearchToExercises < ActiveRecord::Migration[8.0]
  def change
    create_virtual_table :exercise_full_text_search_vectors, :fts5, %w[name description]
  end
end
