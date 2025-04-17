class CreateExerciseSteps < ActiveRecord::Migration[8.0]
  def change
    create_table :exercise_steps do |t|
      t.belongs_to :exercise, null: false, foreign_key: true
      t.string :action
      t.integer :position
      t.integer :duration

      t.timestamps
    end
  end
end
