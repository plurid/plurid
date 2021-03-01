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
```
