.PHONY: bundle clean

bundle: clean
	node bundle.js

clean:
	rm -f index.js src/routeGetRequest.js