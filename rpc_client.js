const amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(err, conn){
    conn.createChannel(function(err, ch){
        ch.assertQueue('', {exclusive: true}, (err, q) => {
            let corr = uuid();
            let num = 9;
            console.log(' [x] Requisitando fib(%d)', num);
            ch.consume(q.queue, function(msg){
                if(msg.properties.correlationId == corr){
                    console.log('[.] Recebi %s', msg.content.toString());
                    setTimeout(function(){ conn.close(); process.exit(0)}, 500);
                }
            }, {noAck: true});

            ch.sendToQueue('rpc_queue', 
                new Buffer.alloc(Buffer.byteLength(num.toString(), "utf-8"), num.toString()),
                { correlationId: corr, replyTo: q.queue})
        })
    })
})

function uuid(){
    return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}