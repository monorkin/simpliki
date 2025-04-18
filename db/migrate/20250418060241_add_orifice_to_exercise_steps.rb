class AddOrificeToExerciseSteps < ActiveRecord::Migration[8.0]
  def change
    add_column :exercise_steps, :orifice, :string
  end
end
