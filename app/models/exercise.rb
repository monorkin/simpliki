# frozen_string_literal: true

class Exercise < ApplicationRecord
  include Searchable

  has_rich_text :description

  has_many :steps, inverse_of: :exercise, dependent: :destroy

  accepts_nested_attributes_for :steps, allow_destroy: true, reject_if: :all_blank

  def self.random = order("RANDOM()").limit(1).first

  def excerpt
    description.to_plain_text.truncate(100)
  end
end
