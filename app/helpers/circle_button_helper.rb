module CircleButtonHelper
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

  def animated_circle(**options)
    content_tag(
      :svg,
      class: class_names("animated-circle", options[:class]),
      viewBox: "0 0 200 200",
      xmlns: "http://www.w3.org/2000/svg",
      data: { controller: "circle-animation" }
    ) do
      content_tag(
        :path,
        nil,
        fill: "currentColor",
        stroke: "none",
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
    end
  end
end
