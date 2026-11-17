class TrainingsController < ApplicationController
  def new
    @training = current_user.trainings.build(
      challenge_type: params[:challenge_type]
    )
  end

  def create
    @training = current_user.trainings.build(training_params)
    @training.status = "draft"

    if @training.save
      redirect_to trainings_path, notice: "Training created.", status: :see_other
    else
      render :new, status: :unprocessable_entity
    end
  end

  def index
    @trainings = current_user.trainings.order(created_at: :desc)
  end

  def show
    @training = current_user.trainings.find(params[:id])
  end

  def edit
    @training = current_user.trainings.find(params[:id])
  end

  def update
    @training = current_user.trainings.find(params[:id])

    if @training.update(training_params)
      redirect_to training_path(@training), notice: "Training updated.", status: :see_other
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @training = current_user.trainings.find(params[:id])
    @training.destroy!

    redirect_to trainings_path, notice: "Training deleted.", status: :see_other
  end

  private

  def training_params
    params.require(:training).permit(:challenge_type, :target_job, :job_description)
  end
end
