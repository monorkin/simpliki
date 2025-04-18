# frozen_string_literal: true

module ExerciseHelper
  def serialize_exercise(exercise)
    exercise.steps.ordered.map do |step|
      {
        action: step.action,
        orifice: step.orifice,
        duration: step.duration
      }
    end.to_json
  end
end
