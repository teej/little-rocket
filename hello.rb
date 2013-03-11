require 'sinatra'

set :public_folder, 'lib'

get '/' do
  redirect '/index.html'
end