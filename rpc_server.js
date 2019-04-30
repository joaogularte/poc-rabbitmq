const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'rpc_queue';
        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(' Guardando requests ');
        ch.consume(q, function(msg){
            let n = parseInt(msg.content.toString());
            console.log(' [.] fib(%d)', n);
            let r = fibonacci(n);
            console.log(r);
            console.log(msg.properties.replyTo);
            ch.sendToQueue(msg.properties.replyTo,
                new Buffer.alloc(Buffer.byteLength(r.toString(), "utf-8"), r.toString()),
                { correlationId: msg.properties.correlationId});
            ch.ack(msg);
        });         
    });
});


function fibonacci(n){
    if(n == 0 || n == 1){
        return n;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}