# frozen_string_literal: true

module CircleHelper
  def circle_button(**options)
    content_tag(
      :div,
      class: options.fetch(:class, "relative inline-block"),
    ) do
      content_tag(:div, **options.fetch(:container, {}).reverse_merge(class: "absolute inset-0 z-20 flex justify-center")) do
        yield if block_given?
      end +
      animated_circle(**options.fetch(:circle, {}).reverse_merge(class: "absolute inset-0 z-10"))
    end
  end

  def exercise_circle(exercise, **options)
    content_tag(
      :div,
      class: "flex flex-col",
      data: { controller: "exercise", exercise_steps_value: serialize_exercise(@exercise) }
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

  def animated_circle(**options)
    fill = options.fetch(:fill, "currentColor")
    stroke = options.fetch(:stroke, "none")
    stroke_width = options.fetch(:stroke_width, 0)
    is_symbol = options[:symbol].present?
    style = []

    style << "--name: #{options[:name]}" if options[:name]

    data = options.fetch(:data, {}).reverse_merge(controller: (options[:use] ? nil : "circle-animation"))

    circle_path = content_tag(
      :path,
      nil,
      fill: is_symbol ? nil : fill,
      stroke: is_symbol ? nil : stroke,
      "stroke-width": is_symbol ? nil : stroke_width,
      data: { circle_animation_target: "path" },
      d: <<~PATH
        M 100 20
        C 111 20, 122 22, 132 26
        C 142 30, 151 36, 159 44
        C 167 52, 173 61, 177 71
        C 181 81, 183 92, 183 103
        C 183 114, 181 125, 177 135
        C 173 145, 167 154, 159 162
        C 151 170, 142 176, 132 180
        C 122 184, 111 186, 100 186
        C 89 186, 78 184, 68 180
        C 58 176, 49 170, 41 162
        C 33 154, 27 145, 23 135
        C 19 125, 17 114, 17 103
        C 17 92, 19 81, 23 71
        C 27 61, 33 52, 41 44
        C 49 36, 58 30, 68 26
        C 78 22, 89 20, 100 20 Z
      PATH
    )

    content_tag(
      :svg,
      style: style.join("; ").presence,
      class: class_names("animated-circle", options[:class]),
      viewBox: "0 0 200 200",
      xmlns: "http://www.w3.org/2000/svg",
      data: data,
      id: options[:id]
    ) do
      if options[:use]
        content_tag(:use, nil, href: "##{options[:use]}", stroke: stroke, "stroke-width": stroke_width, fill: fill)
      elsif options[:symbol]
        content_tag(:symbol, id: options[:symbol], viewBox: "0 0 200 200") { circle_path }
      else
        circle_path
      end
    end
  end
end
