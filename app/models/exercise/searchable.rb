# frozen_string_literal: true

class Exercise
  module Searchable
    extend ActiveSupport::Concern

    DEFAULT_LIMIT = 25
    VECTOR_TABLE_NAME = FullTextSearchVector.table_name

    included do
      has_one :full_text_search_vector, foreign_key: :rowid, dependent: :destroy

      after_save :create_or_update_full_text_search_vector
    end

    class_methods do
      def search(query)
        return all if query.blank?

        where("#{VECTOR_TABLE_NAME} MATCH ?", escape_fts_match_value(query))
          .joins(:full_text_search_vector)
          .order("bm25(#{VECTOR_TABLE_NAME})")
          .distinct
      end

      def escape_fts_match_value(input)
        input.to_s
          .gsub('"', '""')
          .split(/\s+/)
          .map { |word| %Q("#{word}") }
          .join(" ")
      end

      def create_or_update_all_full_text_search_vectors
        all.find_each(&:create_or_update_full_text_search_vector)
      end
    end

    def create_or_update_full_text_search_vector
      params = {
        id: id,
        name: name,
        description: description.to_plain_text
      }

      sql = if full_text_search_vector
        ActiveRecord::Base.sanitize_sql_array(
          [
            "UPDATE #{VECTOR_TABLE_NAME} SET name = :name, description = :description WHERE rowid = :id",
            params
          ]
        )
      else
        ActiveRecord::Base.sanitize_sql_array(
          [
            "INSERT INTO #{VECTOR_TABLE_NAME} (rowid, name, description) VALUES (:id, :name, :description)",
            params
          ]
        )
      end

      self.class.connection.execute(sql)
    end
  end
end
