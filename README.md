# resuelve-backend-challenge

## Ejecución
En la terminal ejecuta el siguiente comando:
```
npm start
```
también puede funcionar: 

```
node server.js
```

Se iniciará un servidor disponible en localhost:3000

## Configuración

Al inciar el servidor se carga la configuración default encontrada en el archivo config.json,
esta configuración asignará el rankeo propuesto por __Resuelve FC__ a todo equipo del que no se encuentre una configuración exclusiva.

Para agregar una nueva configuración se requiere de llamar al método POST en el endpoint
**/config** y enviar un JSON con el siguiente formato:

``` JSON
{
  "equipos": [
    {
      "nombre": "Resuelve FC",
      "rankeo": {
        "A": 5,
        "B": 10,
        "C": 15,
        "Cuauh": 20
      }
    },
    {
      "nombre": "rojo",
      "rankeo": {
        "A": 15,
        "B": 20,
        "C": 35,
        "Cuauh": 50
      }
    }
  ]
}
```

De ser necesario se puede resetear la configuración inicial por medio del método GET en el endpoint **/reset_config**.


## Endpoints
### POST: get_salaries
Es el enpoint que ejecuta la función principal de la app, requiere de un JSON con el formato
propuesto por el equipo de __Resuelve FC__:

``` JSON
{
   "jugadores" : [  
      {  
         "nombre":"Juan Perez",
         "nivel":"C",
         "goles":10,
         "sueldo":50000,
         "bono":25000,
         "sueldo_completo":null,
         "equipo":"rojo"
      },
      {  
         "nombre":"EL Cuauh",
         "nivel":"Cuauh",
         "goles":30,
         "sueldo":100000,
         "bono":30000,
         "sueldo_completo":null,
         "equipo":"azul"
      },
      {  
         "nombre":"Cosme Fulanito",
         "nivel":"A",
         "goles":7,
         "sueldo":20000,
         "bono":10000,
         "sueldo_completo":null,
         "equipo":"azul"

      },
      {  
         "nombre":"El Rulo",
         "nivel":"B",
         "goles":9,
         "sueldo":30000,
         "bono":15000,
         "sueldo_completo":null,
         "equipo":"rojo"

      }
   ]
}
```

Regresa un JSON con la variable sueldo_completo correctamente asignada.

### GET: config
Sirve para obtener la configuración de rankeo que actualmente está utilizando el sistema.
No requiere de input. Regresa el objeto config en formato JSON.

### POST: config
Sustituye la configuracióñ de rankeo utilizada actualmente por la propuesta en el payload.
Regresa el JSON de entrada.

### GET: reset_config
Reinicia la app a su configuración inicial. Regresa el contenido de __config.json__.


## Testing
El repositorio contiene un archivo llamado **thunder-collection.json** desde donde se pueden
importar fácilmente las peticiones necesarias para comprobar el funcionamiento de la app.
Es necesario instalar el plug-in __Thunder Client__ de __VS CODE__ para hacer uso de esta colleción.