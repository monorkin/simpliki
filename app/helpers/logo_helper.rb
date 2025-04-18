module LogoHelper
  def logo(**options)
    content_tag(:h1, id: options.fetch(:id, "logo"), class: "logo") do
      content_tag(:span, "Simpl", class: "logo__text") +
      content_tag(:ruby, class: "logo__kanji") do
        raw("息") + content_tag(:rt, "iki")
      end
    end
  end
end
