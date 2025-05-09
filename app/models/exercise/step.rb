# frozen_string_literal: true

class Exercise::Step < ApplicationRecord
  belongs_to :exercise, inverse_of: :steps

  scope :ordered, -> { order(position: :asc, id: :asc) }

  enum :action, %w[ inhale exhale hold ].index_by(&:itself), default: "inhale"
  enum :orifice, %w[ mouth nose none ].index_by(&:itself), default: "mouth", prefix: true
end
