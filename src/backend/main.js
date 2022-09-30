process.on('uncaughtException', (err) => {
    // Prevents the creation of error windows when an error happens on the main process.
    console.log(err);
});

require('@backend/data');
require('@backend/background');
require('@backend/receiver');
