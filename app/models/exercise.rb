# frozen_string_literal: true

class Exercise < ApplicationRecord
  has_rich_text :description

  has_many :steps, inverse_of: :exercise

  accepts_nested_attributes_for :steps, allow_destroy: true

  def self.random = order("RANDOM()").limit(1).first
end
