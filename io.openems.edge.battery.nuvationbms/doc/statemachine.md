# State-Machine

```mermaid
graph TD
Undefined[Undefined] -->|Has faults Any of the Evt1 bit set| error[Error]
Undefined -->|State is Disconnected| gostopped[GO_STOPPED]
Undefined -->|State is INITILIZING, CONNECTED| running[Running]


gostopped --> |State is DISCONNECTED| stopped[STOPPED] 
gostopped --> |Has faults Any of the Evt1 bit set|error

running -->| Has faults Any of the Evt1 bit set| error
running --> |startStop == stop| gostopped

gorunning -->|Has faults Any of the Evt1 bit set| error
gorunning -->|Time out reached| error
gorunning -->|startStop == stop| gostopped
gorunning -->|state is Connected| running

stopped --> |startStop == start| gorunning
stopped -->|Has faults Any of the Evt1 bit set| error
```

View using Mermaid, e.g. https://mermaid-js.github.io/mermaid-live-editor