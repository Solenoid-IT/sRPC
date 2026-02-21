// © Solenoid-IT



export type Event = 'request' | 'response' | 'error';



export class Response
{
    constructor (public code : number, public headers : Headers, public body : any) {}
}



export class Endpoint
{
    private callbackMap = new Map<Event, CallableFunction[]>();

    public path : string;
    public native : boolean = true;



    constructor (path : string)
    {
        this.path = path;
    }



    private static expand (obj : Record<string, any>) : Record<string, any>
    {
        // (Setting the value)
        const output : Record<string, any> = {};

        for ( const key in obj )
        {// Processing each entry
            if ( !Object.prototype.hasOwnProperty.call( obj, key ) ) continue;

            if ( key.includes( '.' ) )
            {// Match OK
                // (Getting the values)
                const parts = key.split( '.' );
                let current = output;



                for ( let i = 0; i < parts.length; i++ )
                {// Iterating each index
                    // (Getting the value)
                    const part = parts[i];

                    if ( i === parts.length - 1 )
                    {// Match OK
                        // (Getting the value)
                        current[part] = obj[key];
                    }
                    else
                    {// Match failed
                        if ( !current[part] )
                        {// Value not found
                            // (Setting the value)
                            current[part] = {};
                        }



                        // (Getting the value)
                        current = current[part];
                    }
                }
            }
            else
            {// Match failed
                // (Getting the value)
                output[key] = obj[key];
            }
        }



        // Returning the value
        return output;
    }



    /**
     * 
     * @param action 
     * @param input 
     * @param headers 
     * @returns Promise<Response>
     * @throws Error
     */
    public async run (action : string, input? : any, headers? : Headers) : Promise<Response>
    {
        // (Getting the value)
        const requestHeaders = new Headers();

        if ( typeof input === 'object' || input instanceof Array )
        {// (Input is a 'JSON')
            // (Setting the header)
            requestHeaders.set( 'Content-Type', 'application/json' );

            // (Getting the value)
            input = JSON.stringify( Endpoint.expand( input ) );
        }
        else
        {// Match failed
            // (Setting the header)
            requestHeaders.set( 'Content-Type', 'text/plain' );

            // (Getting the value)
            input = input === undefined || input === null ? undefined : input.toString();
        }



        if ( headers )
        {// Value found
            for ( const [ key, value ] of headers.entries() )
            {// Processing each entry
                // (Setting the header)
                requestHeaders.set( key, value );
            }
        }



        if ( !this.native )
        {// Value is false
            // (Setting the header)
            requestHeaders.set( 'X-HTTP-Method-Override', 'RUN' );
        }



        // (Getting the value)
        const options =
        {
            'method':  this.native ? 'RUN' : 'POST',
            'headers': requestHeaders,
            'body':    input
        }
        ;



        try
        {
            // (Emitting the event)
            this.emit
            (
                'request',
                {
                    'url':     this.path,
                    'method':  options.method,
                    'headers': Object.fromEntries( requestHeaders.entries() ),
                    'body':    input
                }
            )
            ;



            // (Getting the value)
            const response = await fetch( `${ this.path }?m=${ action }`, options );



            let responseBody = null;

            if ( response.headers.get( 'Content-Type' )?.includes( 'application/json' ) )
            {// Match OK
                // (Getting the value)
                responseBody = await response.json();
            }
            else
            {// Match failed
                // (Getting the value)
                responseBody = await response.text();
            }



            // (Emitting the event)
            this.emit
            (
                'response',
                {
                    'url':     this.path,
                    'method':  options.method,
                    'headers': Object.fromEntries( response.headers.entries() ),
                    'body':    responseBody
                }
            )
            ;



            // Returning the value
            return new Response( response.status, response.headers, responseBody );
        }
        catch (error)
        {
            // (Emitting the event)
            this.emit
            (
                'error',
                {
                    'url':     this.path,
                    'method':  options.method,
                    'headers': Object.fromEntries( requestHeaders.entries() ),
                    'body':    input,
                    'error':   error
                }
            )
            ;



            // Throwing the error
            throw error;
        }
    }



    /**
     * 
     * @param value
     * @description Sets the 'native' property of the endpoint, which determines whether to use the 'RUN' method directly or to use 'POST' with an override header.
     */
    public setNative (value : boolean) : this
    {
        // (Getting the value)
        this.native = value;



        // Returning the value
        return this;
    }



    public addEventListener (event : Event, callback : CallableFunction) : this
    {
        if ( !this.callbackMap.has( event ) )
        {// Value not found
            // (Setting the value)
            this.callbackMap.set( event, [] );
        }



        // (Appending the value)
        this.callbackMap.get( event )!.push( callback );



        // Returning the value
        return this;
    }

    public emit (event : Event, ...args : any[]) : void
    {
        if ( this.callbackMap.has( event ) )
        {// Value found
            for ( const callback of this.callbackMap.get( event )! )
            {// Processing each callback
                // (Calling the callback)
                callback( ...args );
            }
        }
    }
}