# Requests


## Examples

``` bash
curl -d '{"route":"example.com/plurid/route"}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/route


curl -d '{ route example.com/plurid/route }' \
    -H "Content-Type: application/deon" \
    -X POST http://localhost:8080/route



curl -d '{"route":"example.com/plurid/route", "data":{"elementql":"example.com/element"}}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/register




curl -d '{"route":"example.com/plurid/route", "token":"valid"}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/route


curl -d '{"route":"example.com/plurid/route", "token":"valid", "data":{"elementql":"example.com/element"}}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/register
```




## Test Suites

### Route

Request:

``` bash
curl -d '{"route":"example.com/plurid/route"}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/route
```

Expected:

```
Unauthorized
```



Request:

``` bash
curl -d '{"route":"example.com/plurid/route"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
Not Found
```



Request:

``` bash
curl -d '{"token": "token", "route":"example.com/plurid/route"}' \
    -H "Content-Type: application/json" \
    -X POST http://localhost:8080/route
```

Expected:

```
Not Found
```



Request:

``` bash
curl -d '{"route":"/example-valid-registered"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
{"id":"/example-valid-registered"}
```



Request:

``` bash
curl -d '{"route":"/example-valid-elementql"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
{"elementql":"/example-valid-elementql"}
```



Request:

``` bash
curl -d '{"route":"/example-invalid"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
Bad Request
```



### Register

Request:

``` bash
curl -d '{"route":"/registration-example-valid-registered", "data":{"id":"/registration-example-valid-registered"}}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/register
```

Expected:

```
{"registered":true}
```

Request:

``` bash
curl -d '{"route":"/registration-example-valid-registered"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
{"id":"/registration-example-valid-registered"}
```



Request:

``` bash
curl -d '{"route":"/registration-example-valid-elementql", "data":{"elementql":"/registration-example-valid-elementql"}}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/register
```

Expected:

```
{"registered":true}
```

Request:

``` bash
curl -d '{"route":"/registration-example-valid-elementql"}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/route
```

Expected:

```
{"id":"/registration-example-valid-elementql"}
```



Request:

``` bash
curl -d '{"route":"/registration-example-invalid", "data":{}}' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/register
```

Expected:

```
Bad Request
```



### Cache Reset

Request:

``` bash
curl \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/cache-reset
```

Expected:

```
Cache Reseted
```



Request:

``` bash
curl \
    -H "Authorization: Bearer token" \
    -X POST http://localhost:8080/cache-reset
```

Expected:

```
Bad Request
```
