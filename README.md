# goods-api
 
---
 
## Running server
 
To run the server use `npm start`. It started on port 3000 by default. To change it use the environment variable PORT.
 
Database is MongoDB that runs in the cloud.
 
## Endpoints
 
>**All params is JSON**
 
>**For create, update, delete operations required valid Authentication Header with token that returns `login` endpoint**
 
* Auth
  * login `POST /auth/login`
    | Param    | Type   | Expected value |
    | -------- | ------ | -------------- |
    | login    | String | 3+ characters  |
    | password | String | 5+ characters  |
  * signup `POST /auth/signup`
    | Param    | Type   | Expected value |
    | -------- | ------ | -------------- |
    | login    | String | 3+ characters  |
    | password | String | 5+ characters  |
    | email    | String | Valid email    |
 
*   Categories
    *  Get categories list `GET /categories`
    *  Get category products `GET /categories/:categoryId`
    *  Create category `POST /categories/createCategory`
        | Param | Type   | Expected value             |
        | ----- | ------ | -------------------------- |
        | name  | string | Unique name, 1+ characters |
    *  Update category `PUT /categories/updateCategory/:categoryId`
        | Param | Type   | Expected value             |
        | ----- | ------ | -------------------------- |
        | name  | string | Unique name, 1+ characters |
    *  Delete category `DELETE /categories/deleteCategory/:categoryId`
 
*   Products
    *  Get products list `GET /products`
    *  Create product `POST /products/createProduct`
        | Param    | Type   | Expected value             |
        | -------- | ------ | -------------------------- |
        | name     | string | Unique name, 1+ characters |
        | category | Array  | Array of categories id's   |
    *  Update product `PUT /products/updateProduct/:productId`
        | Param    | Type   | Expected value             |
        | -------- | ------ | -------------------------- |
        | name     | string | Unique name, 1+ characters |
        | category | Array  | Array of categories id's   |
    *  Delete product `DELETE /products/deleteProduct/:productId`
 
    
 
## Spent time
 
* Controllers: ~5h
  * Categories: ~2h
  * Product: ~2h
  * Auth: ~1h
* Testing: ~4h
* Refactoring: ~1h
* Readme file: 0.5h