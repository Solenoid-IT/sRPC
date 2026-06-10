export class Response
{
    constructor (public readonly code : number, public readonly body : any, public readonly headers : Record<string, string>) {}
}

export class Client
{
    constructor (public readonly endpointPath : string, public readonly native : boolean = true) {}



    public async run (action : string, input : any = null, headers : Record<string, string> = {}) : Promise<Response>
    {
        const requestHeaders =
        {
            'Content-Type': Client.getRequestContentType( input ),
            ...( this.native ? {} : { 'X-HTTP-Method-Override': 'RUN' } ),
            ...headers
        }
        ;

        const response = await fetch( `${ this.endpointPath }?m=${ action }`, {
            'method': this.native ? 'RUN' : 'POST',
            'headers': requestHeaders,
            'body': Client.getRequestBody( input )
        });

        const responseHeaders : Record<string, string> = {};
        response.headers.forEach( (value, key) => responseHeaders[key] = value );

        const contentType = response.headers.get( 'Content-Type' ) || '';

        let responseBody : any;
        if ( contentType.includes( 'application/json' ) )
        {
            responseBody = await response.json();
        }
        else
        if ( contentType.includes( 'text/' ) )
        {
            responseBody = await response.text();
        }
        else
        {
            responseBody = await response.blob();
        }

        return new Response( response.status, responseBody, responseHeaders );
    }



    private static isSerializable (input : any) : boolean
    {
        return typeof input === 'object' && input !== null && !( input instanceof Blob );
    }

    private static getRequestContentType (input : any) : string
    {
        if ( typeof input === 'string' ) return 'text/plain';
        if ( typeof input === 'number' ) return 'text/plain';
        if ( typeof input === 'boolean' ) return 'text/plain';

        if ( Client.isSerializable( input ) ) return 'application/json';

        return 'application/octet-stream';
    }

    private static getRequestBody (input : any) : any
    {
        if ( Client.isSerializable( input ) ) return JSON.stringify( input );

        return input;
    }
}