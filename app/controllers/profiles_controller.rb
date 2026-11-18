class ProfilesController < ApplicationController
  def show
    @user = current_user
  end

  def update
    @user = current_user
    remove_photo = params.dig(:user, :remove_avatar) == "1" && params.dig(:user, :avatar).blank?

    if @user.update(profile_params)
      @user.avatar.purge if remove_photo
      redirect_to profile_path, notice: "Profile saved.", status: :see_other
    else
      render :show, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:user).permit(:country, :birthday, :industry, :job_title, :experience, :skills, :bio, :avatar)
  end
end
