var config = {}

// Update to have your correct username and password
config.mongoURI = {
    production: 'mongodb+srv://eliki:eliki13720@gallery.wc344.mongodb.net/darkroom?retryWrites=true&w=majority',
    development: 'mongodb+srv://eliki:eliki13720@gallery.wc344.mongodb.net/darkroom-dev?retryWrites=true&w=majority',
    test: 'mongodb+srv://eliki:eliki13720@gallery.wc344.mongodb.net/darkroom-test?retryWrites=true&w=majority',
    prod:'mongodb+srv://eliki:<db_password>@devops09-ip1.zrpcvub.mongodb.net/'
}
module.exports = config;
