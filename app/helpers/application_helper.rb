# frozen_string_literal: true

module ApplicationHelper
  def logo(**options)
    options[:link_to] = root_path unless options.key?(:link_to)

    content_tag(:h1, id: options.fetch(:id, "logo"), class: "logo #{"logo--small" if options[:size] == :small}") do
      concat(content_tag(:span, "Simpl", class: "logo__text"))
      concat(content_tag(:ruby, class: "logo__kanji") do
        raw("息") + content_tag(:rt, "iki")
      end)

      if options[:link_to]
        concat(link_to("", options[:link_to], class: "logo__link"))
      end
    end
  end

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

  def footer
    content_tag(:footer, class: "flex flex-row justify-center gap-4") do
      # concat(link_to "About", "#", class: "link link--muted")

      if authenticated?
        concat(button_to "Logout", session_path, class: "link link--muted")
      else
        concat(link_to "Login", new_session_path, class: "link link--muted")
      end
    end
  end
end
