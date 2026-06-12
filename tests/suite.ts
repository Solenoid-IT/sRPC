import { Client } from '../src/client.ts';



async function testRunWithNativeRUN () : Promise<void>
{
    const client = new Client( 'https://api.example.com/api/user' );

    const { code, body } = await client.run
    (
        'Store/Order.insert',
        {
            'items':
            [
                { 'productId': 101, 'quantity': 2 },
                { 'productId': 202, 'quantity': 1 }
            ]
        }
    );

    console.log( 'native RUN status:', code );
    console.log( 'native RUN body:', body );
}

async function testRunWithPostFallback () : Promise<void>
{
    const client = new Client( 'https://api.example.com/api/user', false );

    const requestHeaders = { 'X-Trace-Id': 'test-123' };

    const { code, body } = await client.run( 'Store/Order.list', { 'page': 1, 'limit': 20 }, requestHeaders );

    console.log( 'POST fallback status:', code );
    console.log( 'POST fallback body:', body );
}



async function runAllTests () : Promise<void>
{
    await testRunWithNativeRUN();
    await testRunWithPostFallback();
}



// runAllTests().catch( console.error );



export { testRunWithNativeRUN, testRunWithPostFallback, runAllTests };
