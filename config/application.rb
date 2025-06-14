require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module TaskNote
  class Application < Rails::Application
    config.load_defaults 7.1

    config.autoload_lib(ignore: %w(assets tasks))

    # 追加！lib配下のクラスも自動読み込み対象にする
    config.eager_load_paths << Rails.root.join("lib")

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore

    config.time_zone = 'Tokyo'
    config.active_record.default_timezone = :local


    config.api_only = true
  end
end
