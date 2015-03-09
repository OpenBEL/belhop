----
# Configuration Test

Testing the configuration and server availability.

Create a {@link Callback callback} using the {@link belhop.factory.callback
factory}.

```javascript
function success() {
    // configuration is valid, server is available
}
function error() {
    // check configuration/server availability
}
var cb = belhop.factory.callback(success, error);
```

Pass the {@link Callback callback} to the {@link belhop.configuration.test
test} function of the {@link belhop.configuration configuration} namespace.

```javascript
belhop.configuration.test(cb);
```
