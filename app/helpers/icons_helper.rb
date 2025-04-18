# frozen_string_literal: true

module IconsHelper
  def back_chevron(**options)
    options = options.reverse_merge(
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none", viewBox: "0 0 24 24",
      "stroke-width" => "1.5",
      stroke: "currentColor"
    )

    content_tag(:svg, **options) do
      raw <<~SVG
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      SVG
    end
  end
end
