const warehouseModel = require("../models/warehouseModel");
const inventoryModel = require("../models/inventoryModel");
const { v4: uuidv4 } = require("uuid");

//--------- Warehouse Data ----------
let warehouseData = warehouseModel.fetchWarehouseData();

//--------- Inventory Data ----------
let inventoryData = inventoryModel.fetchInventoryData();

//------- Get all Warehouses List ----------
const warehouseList = (_req, res) => {
  warehouseData = warehouseModel.fetchWarehouseData();
  res.status(200).json({
    status: "success",
    results: warehouseData.length,
    warehouseData,
  });
};

// ---------- Get all inventory items for a Warehouse --------
const warehouseInventory = (req, res) => {
  const id = req.params.id;
  let inventoryData = inventoryModel.fetchInventoryData();
  warehouseData = warehouseModel.fetchWarehouseData();
  const warehouseInventory = inventoryData.filter(
    (list) => list.warehouseID === id
  );
  res.status(200).json({
    status: "success",
    warehouseInventory,
  });
};

// ---------- Get single Warehouse Item --------
const singleWarehouse = (req, res) => {
  const id = req.params.id;
  const warehouse = warehouseData.find((el) => el.id === id);

  res.status(200).json({
    status: "sucess",
    warehouse,
  });
};

// -------Add a new Warehouse--------
const addWarehouse = (req, res) => {
  if (
    !req.body.name ||
    !req.body.address ||
    !req.body.city ||
    !req.body.country ||
    !req.body.contactName ||
    !req.body.contactPosition ||
    !req.body.contactPhone ||
    !req.body.contactEmail
  ) {
    return res.status(400).json({ error: "missing field" });
  }

  const newWarehouse = {
    id: uuidv4(),
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    contact: {
      name: req.body.contactName,
      position: req.body.contactPosition,
      phone: req.body.contactPhone,
      email: req.body.contactEmail,
    },
  };

  let warehouseData = warehouseModel.fetchWarehouseData();
  warehouseData.push(newWarehouse);
  warehouseModel.writeWarehouseData(warehouseData);
  res.status(200).json("new warehouse added");
};

// ---------- Delete Warehouse and ascociated inventory --------
const deleteWarehouse = (req, res) => {
  let warehouses = warehouseModel.fetchWarehouseData();
  let currentwarehouse = warehouses.find(
    (warehouse) => warehouse.id === req.params.id
  );
  warehouses.splice(warehouses.indexOf(currentwarehouse), 1);
  warehouseModel.writeWarehouseData(warehouses);
  let inventory = inventoryModel.fetchInventoryData();
  inventory = inventory.filter((item) => item.warehouseID !== req.params.id);
  inventoryModel.writeInventoryData(inventory);
  res.status(200).json(currentwarehouse);
};

//------ Check empty fields Function  ------
const checkFields = (req, res, next) => {
  if (
    !req.body.name ||
    !req.body.address ||
    !req.body.city ||
    !req.body.country ||
    !req.body.contact
  )
    return res.status(404).json({
      status: "fail",
      message: "Please, fill all the fields! ",
    });
  next();
};

//------------ Validation Function -----------
const fieldValidation = (req, res, next) => {
  const { email } = req.body.contact;
  const { phone } = req.body.contact;
  const validEmail = warehouseData.find((el) => el.contact.email === email);
  const validPhone = warehouseData.find((el) => el.contact.phone === phone);

  if (validEmail && validPhone) {
    res.status(200).json({
      status: "sucess",
      mensagem: "Email and Phone Number validated!",
    });
  } else {
    res.status(400).json({
      status: "fail",
      messagem: "Enter a valid email or phone number.",
    });
  }
  next();
};

//------- Put Request Warehouse ----------
const editWareHouse = (req, res) => {
  const id = req.params.id;
  const newWarehouse = warehouseData.filter((el) => el.id !== id);
  const newWarehouseBody = req.body;
  const newWarehouseData = [...newWarehouse, newWarehouseBody];

  if (newWarehouse) {
    warehouseModel.writeWarehouseData(newWarehouseData);
    res.status(200).send({
      newWarehouseData,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

module.exports = {
  warehouseList,
  warehouseInventory,
  addWarehouse,
  deleteWarehouse,
  checkFields,
  fieldValidation,
  editWareHouse,
  singleWarehouse,
};
