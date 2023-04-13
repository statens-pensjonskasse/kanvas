import { LRUCache } from "lru-cache";


let cache: LRUCache<string, string>;

declare global {
    var __cache: LRUCache<string, string> | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
    cache = new LRUCache({
        max: 1000,

        // for use with tracking overall storage size
        maxSize: 5000,
        sizeCalculation: (value, key) => {
            return 1
        },
        // how long to live in ms
        ttl: 1000 * 60 * 60 * 24,

    });
} else {
    if (!global.__cache) {
        global.__cache = new LRUCache({
            max: 1000,

            // for use with tracking overall storage size
            maxSize: 5000,
            sizeCalculation: (value, key) => {
                return 1
            },
            // how long to live in ms
            ttl: 1000 * 60 * 60 * 24,

        });
    }
    cache = global.__cache;
}

export { cache };
