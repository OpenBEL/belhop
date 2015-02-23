# Working With Annotations

## Create Evidence Using Factory Functions

Here we create the minimal representation of {@link Evidence evidence}.

```javascript
var statement = 'p(foo) increases p(bar)';
var citation = belhop.factory.citation(10022765, 'PubMed');
var evidence = belhop.factory.evidence(statement, citation);
```

## Add Annotation From Search Results

This uses the backend API to search values of an annotation type. A search
result is then added.

```javascript
TODO
```

## Add Annotation By Type

This uses the backend API to add a specific annotation type by a
<em>known</em> value.

```javascript
// taxon will hold the annotation type on callback success
var taxon = null;
function success(response) {
    taxon = response;
}
var cb = belhop.factory.callbackNoErrors(success);

// get the annotation type
belhop.annotations.getType('taxon', cb);

// add the known value
belhop.evidence.annotation.addType(evidence, taxon, '9606');
```

## Add Annotation By Prefix and Value

This uses the BELHop API to directly add a specific annotation by prefix and
value.

```javascript
var nameValueAnnotation = belhop.factory.annotations.nameValueAnnotation('taxon', '9606');
belhop.evidence.annotation.addNameValue(evidence, nameValueAnnotation);
```

## Add Annotation By Value

This uses the backend API to get a specific annotation value by <em>prefix</em>
and <em>value</em>.

```javascript
var annotationValue = null;
function success(response) {
    annotationValue = response;
}
var cb = belhop.factory.callbackNoErrors(success);

// get the annotation value
belhop.annotations.getValue('taxon', '9606');
```

The result is then added to evidence through the BELHop API.

```javascript
belhop.evidence.annotation.addAnnotation(evidence, annotationValue);
```
