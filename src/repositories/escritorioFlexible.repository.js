const EscritorioFlexible = require("../models/escritorioFlexible.model");
const Usuario = require("../models/usuario.model");
const Edificio = require("../models/edificio.model");
const EmpresaInmobiliaria = require("../models/empresaInmobiliaria.model");
const connectToRedis = require("../services/redis.service");

const _getEscritorioRedisKey = (id) => `id:${id}-escritorio`;
const _getEscritoriosFilterRedisKey = (filtros, skip, limit) =>
  `escritorios:${JSON.stringify(filtros)}:skip=${skip}:limit=${limit}`;
const _getEscritorioByCodigoRedisKey = (codigo) =>
  `escritorio:codigo:${codigo}`;
const _getEscritoriosByNombreRedisKey = (nombre) =>
  `escritorios:nombre:${nombre}`;
const _getEscritoriosByEdificioRedisKey = (edificioId) =>
  `edificio:${edificioId}-escritorios`;
const _getEscritoriosByTipoRedisKey = (tipo) => `escritorios:tipo:${tipo}`;
const _getEscritoriosByAmenidadesRedisKey = (tipoAmenidad) =>
  `escritorios:amenidad:${tipoAmenidad}`;
const _getEscritoriosByUsuarioRedisKey = (usuarioId) =>
  `usuario:${usuarioId}-escritorios`;
const _getEscritoriosByRangoPrecioRedisKey = (
  precioMin,
  precioMax,
  tipoPrecio
) => `escritorios:precio:${tipoPrecio}:${precioMin}-${precioMax}`;
const _getEscritoriosDisponiblesRedisKey = (fecha) =>
  `escritorios:disponibles:${fecha}`;
const _getEscritoriosByProximidadRedisKey = (lat, lng, radioKm) => `escritorios:proximidad:${lat}:${lng}:${radioKm}`;
const _getEscritoriosByCiudadRedisKey = (ciudad) => `escritorios:ciudad:${ciudad}`;
const _getEscritoriosByDepartamentoRedisKey = (departamento) => `escritorios:departamento:${departamento}`;

const getEscritoriosFlexibles = async (filtros = {}, skip = 0, limit = 10) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosFilterRedisKey(filtros, skip, limit);

  try {
    const exists = await redisClient.exists(key);
    if (exists) {
      const cached = await redisClient.get(key);
      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {
        }
      } else if (cached) {
        return cached;
      }
    }

    console.log("[Mongo] getEscritoriosFlexibles con paginación");
    const result = await EscritorioFlexible.find(filtros)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .skip(skip)
      .limit(limit)
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;

  } catch (error) {
    console.log("[Error Redis] leyendo desde MongoDB sin cache", error);
    try {
      return await EscritorioFlexible.find(filtros)
        .populate("ubicacion.edificioId")
        .populate("usuarioId", "nombre email imagen")
        .populate("empresaInmobiliariaId", "nombre")
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (mongoError) {
      console.error("[Error Mongo] al obtener escritorios flexibles", mongoError);
      throw mongoError;
    }
  }
};

const findEscritorioFlexibleById = async (id) => {
  const redisClient = connectToRedis();
  const key = _getEscritorioRedisKey(id);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo findEscritorioFlexibleById desde MongoDB]");
    const result = await EscritorioFlexible.findById(id)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.findById(id)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const findEscritorioFlexibleByCodigo = async (codigo) => {
  const redisClient = connectToRedis();
  const key = _getEscritorioByCodigoRedisKey(codigo);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo findEscritorioFlexibleByCodigo desde MongoDB]");
    const result = await EscritorioFlexible.findOne({ codigo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    if (result) {
      await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.findOne({ codigo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByNombre = async (nombre) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByNombreRedisKey(nombre);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByNombre desde MongoDB]");
    const result = await EscritorioFlexible.find({
      nombre: { $regex: nombre, $options: 'i' }
    })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.find({
      nombre: { $regex: nombre, $options: 'i' }
    })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByEdificio = async (edificioId) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByEdificioRedisKey(edificioId);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByEdificio desde MongoDB]");
    const result = await EscritorioFlexible.find({
      "ubicacion.edificioId": edificioId,
    })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.find({ "ubicacion.edificioId": edificioId })
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByTipo = async (tipo) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByTipoRedisKey(tipo);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByTipo desde MongoDB]");
    const result = await EscritorioFlexible.find({ tipo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.find({ tipo })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByAmenidades = async (tipoAmenidad) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByAmenidadesRedisKey(tipoAmenidad);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByAmenidades desde MongoDB]");
    const result = await EscritorioFlexible.find({
      "amenidades.tipo": tipoAmenidad,
    })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.find({ "amenidades.tipo": tipoAmenidad })
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByUsuario = async (usuarioId) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByUsuarioRedisKey(usuarioId);

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByUsuario desde MongoDB]");
    const result = await EscritorioFlexible.find({ usuarioId })
      .populate("ubicacion.edificioId")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    return await EscritorioFlexible.find({ usuarioId })
      .populate("ubicacion.edificioId")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByRangoPrecio = async (
  precioMin,
  precioMax,
  tipoPrecio = "porDia"
) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByRangoPrecioRedisKey(
    precioMin,
    precioMax,
    tipoPrecio
  );

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosByRangoPrecio desde MongoDB]");
    const query = {};
    query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };

    const result = await EscritorioFlexible.find(query)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });

    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    const query = {};
    query[`precios.${tipoPrecio}`] = { $gte: precioMin, $lte: precioMax };

    return await EscritorioFlexible.find(query)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

const getEscritoriosByProximidad = async (lat, lng, radioKm = 10) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByProximidadRedisKey(lat, lng, radioKm);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await EscritorioFlexible.find({
      "ubicacion.coordenadas": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: radioKm * 1000
        }
      },
      activo: true
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 1800 });
    
    return result;
  } catch (error) {
    console.log("[Error en búsqueda geoespacial]", error);
    return await EscritorioFlexible.find({ activo: true })
      .populate('ubicacion.edificioId')
      .populate('usuarioId', 'nombre email imagen')
      .populate('empresaInmobiliariaId', 'nombre')
      .lean();
  }
};

const getEscritoriosByCiudad = async (ciudad) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByCiudadRedisKey(ciudad);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await EscritorioFlexible.find({ 
      'ubicacion.direccionCompleta.ciudad': ciudad,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await EscritorioFlexible.find({ 
      'ubicacion.direccionCompleta.ciudad': ciudad,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const getEscritoriosByDepartamento = async (departamento) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosByDepartamentoRedisKey(departamento);
  
  try {
    const exists = await redisClient.exists(key);
    
    if (exists) {
      const cached = await redisClient.get(key);
      
      if (typeof cached === 'object' && cached !== null) {
        return cached;
      }
      
      if (typeof cached === 'string') {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }
    
    const result = await EscritorioFlexible.find({ 
      'ubicacion.direccionCompleta.departamento': departamento,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
    
    await redisClient.set(key, result, { ex: 3600 });
    
    return result;
  } catch (error) {
    return await EscritorioFlexible.find({ 
      'ubicacion.direccionCompleta.departamento': departamento,
      activo: true 
    })
    .populate('ubicacion.edificioId')
    .populate('usuarioId', 'nombre email imagen')
    .populate('empresaInmobiliariaId', 'nombre')
    .lean();
  }
};

const createEscritorioFlexible = async (escritorioData) => {
  const redisClient = connectToRedis();

  if (!escritorioData.usuarioId) {
    throw new Error("usuarioId es obligatorio");
  }

  const usuarioExiste = await Usuario.exists({ _id: escritorioData.usuarioId });
  if (!usuarioExiste) {
    throw new Error("Usuario no encontrado");
  }

  if (!escritorioData.ubicacion?.coordenadas?.lat || !escritorioData.ubicacion?.coordenadas?.lng) {
    throw new Error("Coordenadas (lat, lng) son obligatorias");
  }
  
  if (!escritorioData.ubicacion?.direccionCompleta) {
    throw new Error("Dirección completa es obligatoria");
  }

  if (escritorioData.empresaInmobiliariaId) {
    const empresaExiste = await EmpresaInmobiliaria.exists({
      _id: escritorioData.empresaInmobiliariaId,
    });
    if (!empresaExiste) {
      throw new Error("empresa no encontrada");
    }
  }

  if (escritorioData.ubicacion?.edificioId) {
    const edificioExiste = await Edificio.exists({
      _id: escritorioData.ubicacion.edificioId,
    });
    if (!edificioExiste) {
      throw new Error("Edificio no encontrado");
    }
  }

  const newEscritorio = new EscritorioFlexible(escritorioData);
  const saved = await newEscritorio.save();

  try {
    const allEscritorioKeys = await redisClient.keys("escritorios:*");
    if (allEscritorioKeys.length > 0) {
      await redisClient.del(...allEscritorioKeys);
    }

    if (saved.codigo) {
      await redisClient.del(_getEscritorioByCodigoRedisKey(saved.codigo));
    }
    if (saved.nombre) {
      await redisClient.del(_getEscritoriosByNombreRedisKey(saved.nombre));
    }
    if (saved.ubicacion && saved.ubicacion.edificioId) {
      await redisClient.del(
        _getEscritoriosByEdificioRedisKey(saved.ubicacion.edificioId.toString())
      );
    }
    if (saved.tipo) {
      await redisClient.del(_getEscritoriosByTipoRedisKey(saved.tipo));
    }
    if (saved.usuarioId) {
      await redisClient.del(
        _getEscritoriosByUsuarioRedisKey(saved.usuarioId.toString())
      );
    }

    console.log("✅ Cache invalidated successfully after creating escritorio");
  } catch (cacheError) {
    console.error("❌ Error invalidating cache:", cacheError);
  }

  return saved;
};

const updateEscritorioFlexible = async (id, payload) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  
  if (!escritorio) {
    throw new Error("Escritorio flexible no encontrado");
  }

  if (payload.usuarioId && payload.usuarioId !== escritorio.usuarioId?.toString()) {
    const usuarioExiste = await Usuario.exists({ _id: payload.usuarioId });
    if (!usuarioExiste) {
      throw new Error("Nuevo usuario no encontrado");
    }
  }
  
  const updated = await EscritorioFlexible.findByIdAndUpdate(id, payload, {
    new: true,
  })
  .populate("ubicacion.edificioId")
  .populate("usuarioId", "nombre email imagen")
  .populate("empresaInmobiliariaId", "nombre");

  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));

  if (escritorio.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(escritorio.codigo));
  }
  if (updated.codigo && escritorio.codigo !== updated.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(updated.codigo));
  }

  if (escritorio.nombre) {
    await redisClient.del(_getEscritoriosByNombreRedisKey(escritorio.nombre));
  }
  if (updated.nombre && escritorio.nombre !== updated.nombre) {
    await redisClient.del(_getEscritoriosByNombreRedisKey(updated.nombre));
  }

  if (escritorio.ubicacion && escritorio.ubicacion.edificioId) {
    await redisClient.del(
      _getEscritoriosByEdificioRedisKey(
        escritorio.ubicacion.edificioId.toString()
      )
    );
  }
  if (
    updated.ubicacion &&
    updated.ubicacion.edificioId &&
    (!escritorio.ubicacion ||
      !escritorio.ubicacion.edificioId ||
      escritorio.ubicacion.edificioId.toString() !==
        updated.ubicacion.edificioId.toString())
  ) {
    await redisClient.del(
      _getEscritoriosByEdificioRedisKey(updated.ubicacion.edificioId.toString())
    );
  }

  if (escritorio.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(escritorio.tipo));
  }
  if (updated.tipo && escritorio.tipo !== updated.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(updated.tipo));
  }

  if (escritorio.usuarioId) {
    await redisClient.del(
      _getEscritoriosByUsuarioRedisKey(escritorio.usuarioId.toString())
    );
  }
  if (
    updated.usuarioId &&
    (!escritorio.usuarioId ||
      escritorio.usuarioId.toString() !== updated.usuarioId.toString())
  ) {
    await redisClient.del(
      _getEscritoriosByUsuarioRedisKey(updated.usuarioId.toString())
    );
  }

  await redisClient.keys("escritorios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  await redisClient.keys('escritorios:proximidad:*').then(keys => {
    keys.forEach(key => redisClient.del(key));
  });

  return updated;
};

const deleteEscritorioFlexible = async (id) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  const removed = await EscritorioFlexible.findByIdAndDelete(id);

  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));

  if (escritorio.codigo) {
    await redisClient.del(_getEscritorioByCodigoRedisKey(escritorio.codigo));
  }
  if (escritorio.nombre) {
    await redisClient.del(_getEscritoriosByNombreRedisKey(escritorio.nombre));
  }
  if (escritorio.ubicacion && escritorio.ubicacion.edificioId) {
    await redisClient.del(
      _getEscritoriosByEdificioRedisKey(
        escritorio.ubicacion.edificioId.toString()
      )
    );
  }
  if (escritorio.tipo) {
    await redisClient.del(_getEscritoriosByTipoRedisKey(escritorio.tipo));
  }
  if (escritorio.usuarioId) {
    await redisClient.del(
      _getEscritoriosByUsuarioRedisKey(escritorio.usuarioId.toString())
    );
  }

  await redisClient.keys("escritorios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return removed;
};

const cambiarEstadoEscritorio = async (id, nuevoEstado) => {
  const redisClient = connectToRedis();
  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );

  await redisClient.del(_getEscritorioRedisKey(id));
  await redisClient.del(_getEscritoriosFilterRedisKey({}));

  await redisClient.keys("escritorios:disponibles:*").then((keys) => {
    keys.forEach((key) => redisClient.del(key));
  });

  return updated;
};

const agregarAmenidad = async (id, amenidad) => {
  const redisClient = connectToRedis();
  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $push: { amenidades: amenidad } },
    { new: true }
  );

  await redisClient.del(_getEscritorioRedisKey(id));
  if (amenidad.tipo) {
    await redisClient.del(_getEscritoriosByAmenidadesRedisKey(amenidad.tipo));
  }

  return updated;
};

const eliminarAmenidad = async (id, amenidadId) => {
  const redisClient = connectToRedis();
  const escritorio = await EscritorioFlexible.findById(id);
  const amenidadAEliminar = escritorio.amenidades.find(
    (a) => a._id.toString() === amenidadId
  );

  const updated = await EscritorioFlexible.findByIdAndUpdate(
    id,
    { $pull: { amenidades: { _id: amenidadId } } },
    { new: true }
  );

  await redisClient.del(_getEscritorioRedisKey(id));
  if (amenidadAEliminar && amenidadAEliminar.tipo) {
    await redisClient.del(
      _getEscritoriosByAmenidadesRedisKey(amenidadAEliminar.tipo)
    );
  }

  return updated;
};

const getEscritoriosDisponibles = async (fecha) => {
  const redisClient = connectToRedis();
  const key = _getEscritoriosDisponiblesRedisKey(fecha || "todas");

  try {
    const exists = await redisClient.exists(key);

    if (exists) {
      const cached = await redisClient.get(key);

      if (typeof cached === "object" && cached !== null) {
        return cached;
      }

      if (typeof cached === "string") {
        try {
          return JSON.parse(cached);
        } catch (parseError) {}
      }
    }

    console.log("[Leyendo getEscritoriosDisponibles desde MongoDB]");
    const filtrosBase = {
      estado: "disponible",
      activo: true,
    };

    const result = await EscritorioFlexible.find(filtrosBase)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();

    await redisClient.set(key, JSON.stringify(result), { ex: 3600 });
    return result;
  } catch (error) {
    console.log("[Error en Redis, leyendo desde MongoDB]", error);
    const filtrosBase = {
      estado: "disponible",
      activo: true,
    };

    return await EscritorioFlexible.find(filtrosBase)
      .populate("ubicacion.edificioId")
      .populate("usuarioId", "nombre email imagen")
      .populate("empresaInmobiliariaId", "nombre")
      .lean();
  }
};

module.exports = {
  getEscritoriosFlexibles,
  findEscritorioFlexibleById,
  findEscritorioFlexibleByCodigo,
  getEscritoriosByNombre, 
  getEscritoriosByEdificio,
  getEscritoriosByTipo,
  getEscritoriosByAmenidades,
  getEscritoriosByUsuario,
  getEscritoriosByRangoPrecio,
  getEscritoriosByProximidad,
  getEscritoriosByCiudad,
  getEscritoriosByDepartamento,
  createEscritorioFlexible,
  updateEscritorioFlexible,
  deleteEscritorioFlexible,
  cambiarEstadoEscritorio,
  agregarAmenidad,
  eliminarAmenidad,
  getEscritoriosDisponibles,
};