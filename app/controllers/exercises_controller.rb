# frozen_string_literal: true

class ExercisesController < ApplicationController
  allow_unauthenticated_access only: %i[ home show index ]
  before_action :set_exercise, only: %i[ show edit update destroy ]

  def home
    @exercise = Exercise.random
  end

  def index
    exercises = Exercise.search(params.dig(:search, :query)).order(name: :asc, id: :asc)
    set_page_and_extract_portion_from exercises,
      per_page: [ 3, 5, 5, 10 ]
  end

  def show
  end

  def new
    @exercise = Exercise.new
  end

  def create
    @exercise = Exercise.new(exercise_params)

    if @exercise.save
      redirect_to action: :show, id: @exercise.id, status: :see_other, flush: { notice: "Added" }
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @exercise.update(exercise_params)
      redirect_to action: :show, status: :see_other, flush: { notice: "Updated" }
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @exercise.destroy
    redirect_to action: :index, status: :see_other, flush: { notice: "Deleted" }
  end

  private

    def set_exercise
      @exercise = Exercise.find(params[:id])
    end

    def exercise_params
      params.require(:exercise).permit(
        :name,
        :description,
        steps_attributes: [
          :_destroy,
          :action,
          :duration,
          :id,
          :orifice,
          :position
        ]
      )
    end
end
