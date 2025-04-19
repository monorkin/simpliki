# frozen_string_literal: true

module ExerciseHelper
  def exercise_circle(exercise, **options)
    content_tag(
      :div,
      class: "flex flex-col",
      data: { controller: "exercise", exercise_steps_value: serialize_exercise(@exercise), exercise_autostart_value: options[:autostart] }
    ) do
      content_tag(:div, "", class: "flex justify-center select-none min-h-6", data: { exercise_target: "instruction" }) +
      content_tag(:div, class: "relative flex size-64") do
        circle_id = dom_id(exercise, :breath_guide)

        content_tag(:div, "", class: "absolute inset-0 z-40 flex justify-center items-center cursor-pointer text-black text-xl", data: { action: "click->exercise#toggle", exercise_target: "overlay" }) +
        animated_circle(symbol: circle_id, class: "hidden") +
        animated_circle(use: circle_id, class: "absolute inset-0 z-30 w-full select-none transition-all duration-300", stroke: "black", stroke_width: 2, name: "exercise-circle-min", data: { exercise_target: "minCircle" }) +
        animated_circle(use: circle_id, class: "absolute inset-0 z-20 w-full select-none transition-all", data: { exercise_target: "progressCircle" }) +
        animated_circle(use: circle_id, class: "absolute inset-0 z-10 w-full select-none opacity-10", name: "exercise-circle-max", data: { exercise_target: "maxCircle" })
      end +
      content_tag(:div, "", class: "flex justify-center select-none min-h-6", data: { exercise_target: "timer" })
    end
  end

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
