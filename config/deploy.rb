# config valid only for current version of Capistrano
# lock '3.4.0'

set :application, 'carpi'
set :repo_url, 'git@github.com:SanchoRubyroid/CarPi-Rails.git'
set :repository_cache, 'git_cache'
set :deploy_via, :remote_cache

set :rvm_ruby_version, '2.2.4'

set :passenger_restart_with_touch, true
set :passenger_rvm_ruby_version, fetch(:rvm_ruby_version)

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/var/rails/carpi'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')

# Default value for linked_dirs is []
# set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do
  task :custom_symlink do
    on roles(:app) do
      info 'Creating secure symlinks'
      %w{ database secrets }.each do |yaml_name|
        execute "rm #{fetch(:release_path)}/config/#{yaml_name}.yml"
        execute "ln -nfs #{fetch(:deploy_to)}/secure/#{yaml_name}.yml #{fetch(:release_path)}/config/#{yaml_name}.yml"
      end
    end
  end

  task :start_node_app do
    on roles(:app) do
      info 'Start Socket.IO support'

      node_app_path = "#{fetch(:deploy_to)}/nodejs/CarPi-Node"
      logs_path = "#{fetch(:deploy_to)}/shared/logs"
      pid_files_path = "#{fetch(:deploy_to)}/shared/pids"

      forever_options = ['-a -w']
      forever_options << "-o #{logs_path}/node_app.log"
      forever_options << "-l #{logs_path}/node_app.log"
      forever_options << "-e #{logs_path}/node_app.err.log"
      forever_options << "--pidfile #{pid_files_path}/node_app.pid"
      forever_options << "--minUptime 0"
      forever_options << "--watchDirectory '.'"


      execute "cd #{node_app_path} && git pull"
      execute 'forever stopall'
      execute "forever start #{forever_options.join(' ')} #{node_app_path}/main.js"
    end
  end

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

  after :finishing, 'deploy:cleanup'
  after :finishing, 'deploy:start_node_app'
  after 'symlink:shared', 'deploy:custom_symlink'
end
