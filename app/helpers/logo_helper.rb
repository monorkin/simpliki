# frozen_string_literal: true

module LogoHelper
  def logo(**options)
    options[:link_to] = root_path unless options.key?(:link_to)

    content_tag(:h1, id: options.fetch(:id, "logo"), class: "logo") do
      concat(content_tag(:span, "Simpl", class: "logo__text"))
      concat(content_tag(:ruby, class: "logo__kanji") do
        raw("息") + content_tag(:rt, "iki")
      end)

      if options[:link_to]
        concat(link_to("", options[:link_to], class: "logo__link"))
      end
    end
  end
end
