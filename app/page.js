"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore, storage } from "@/firebase";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    primary: {
      main: "#00ffbf",
    },
    secondary: {
      main: "#ff00ff",
    },
    error: {
      main: "#ff1744",
    },
    background: {
      default: "#000000",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
  },
});

// Function to format numbers with commas
const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemImage, setItemImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setItemImage(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const addItem = async (item, quantity, image) => {
    setUploading(true);
    let imageUrl = "";
    if (image) {
      imageUrl = await handleFileUpload(image);
    }

    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await updateDoc(docRef, {
        quantity: existingQuantity + quantity,
        imgUrl: imageUrl || docSnap.data().imgUrl || "",
      });
    } else {
      await setDoc(docRef, { quantity: quantity, imgUrl: imageUrl });
    }

    setNewItem(item);
    await updateInventory();
    setUploading(false);
  };

  const removeItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      if (existingQuantity <= quantity) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: existingQuantity - quantity });
      }
    }
    await updateInventory();
  };

  const deleteEntireItem = async () => {
    if (itemToDelete) {
      const docRef = doc(collection(firestore, "inventory"), itemToDelete);
      await deleteDoc(docRef);
      await updateInventory();
      setDialogOpen(false);
      setItemToDelete("");
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setItemImage(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor={theme.palette.background.default}
        color={theme.palette.text.primary}
        p={3}
      >
        <Box
          width="100%"
          display="flex"
          justifyContent="center"
          p={2}
          bgcolor={theme.palette.primary.main}
          color={theme.palette.text.primary}
          mb={3}
          borderRadius={2}
          boxShadow={3}
        >
          <Typography variant="h3" fontWeight="bold">
            StockLog
          </Typography>
        </Box>

        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={{ xs: "90%", sm: 400 }}
            bgcolor={theme.palette.background.default}
            boxShadow={24}
            p={4}
            borderRadius={8}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              border: `2px solid ${theme.palette.primary.main}`,
              transform: "translate(-50%,-50%)",
            }}
          >
            <Typography variant="h6" align="center" color="textPrimary">
              Add New Item
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                InputProps={{
                  style: {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: theme.palette.text.primary,
                    borderRadius: 8,
                  },
                }}
              />
              <TextField
                variant="outlined"
                type="number"
                placeholder="Quantity"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                InputProps={{
                  style: {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: theme.palette.text.primary,
                    borderRadius: 8,
                  },
                  inputProps: {
                    min: 1,
                  },
                }}
              />
            </Stack>
            <TextField
              type="file"
              onChange={handleFileChange}
              fullWidth
              InputProps={{
                style: {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: theme.palette.text.primary,
                  borderRadius: 8,
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await addItem(itemName, itemQuantity, itemImage);
                handleClose();
              }}
              disabled={uploading}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "0px 0px 20px rgba(0, 255, 191, 0.7)",
                  color: "#ffffff",
                },
                transition: "all 0.3s ease-in-out",
                borderRadius: 2,
                color: theme.palette.text.primary,
              }}
            >
              {uploading ? <CircularProgress size={24} color="inherit" /> : "Add Item"}
            </Button>
          </Box>
        </Modal>

        {/* Confirmation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'black',
              color: theme.palette.text.primary,
            },
          }}
        >
          <DialogTitle id="confirm-dialog-title" sx={{ bgcolor: 'black', color: theme.palette.text.primary }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ bgcolor: 'black', color: theme.palette.text.primary }}>
            <Typography id="confirm-dialog-description">
              Are you sure you want to delete this item? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: 'black' }}>
            <Button
              onClick={() => setDialogOpen(false)}
              color="secondary"
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.secondary.main,
                  color: "#ffffff",
                },
                transition: "all 0.3s ease-in-out",
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteEntireItem}
              color="error"
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.error.main,
                  color: "#ffffff",
                },
                transition: "all 0.3s ease-in-out",
                borderRadius: 2,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          width="100%"
          maxWidth="800px"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpen}
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                boxShadow: "0px 0px 20px rgba(0, 255, 191, 0.7)",
                color: "#ffffff",
              },
              transition: "all 0.3s ease-in-out",
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}`,
              color: theme.palette.primary.main,
            }}
          >
            Add New Item
          </Button>
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              style: {
                backgroundColor: "rgba(255,255,255,0.1)",
                color: theme.palette.text.primary,
                borderRadius: 8,
              },
            }}
          />
          <Box width="100%" mt={2}>
            <Typography variant="h5" align="center" color="textPrimary">
              Inventory Items
            </Typography>
            <Stack spacing={2} mt={2} width="100%">
              {filteredInventory.map(({ name, quantity, imgUrl }) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                >
                  <Box
                    p={2}
                    bgcolor="rgba(255, 255, 255, 0.1)"
                    color={theme.palette.text.primary}
                    borderRadius={2}
                    boxShadow={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexDirection={{ xs: "column", sm: "row" }}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    {imgUrl && (
                      <Box
                        component="img"
                        src={imgUrl}
                        alt={name}
                        width={50}
                        height={50}
                        mr={2}
                        sx={{ borderRadius: 2 }}
                      />
                    )}
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      {formatNumber(quantity)}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" mt={{ xs: 2, sm: 0 }}>
                      <TextField
                        variant="outlined"
                        type="number"
                        placeholder="Qty"
                        defaultValue={1}
                        InputProps={{
                          style: {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: theme.palette.text.primary,
                            borderRadius: 8,
                            width: 80,
                          },
                          inputProps: {
                            min: 1,
                          },
                        }}
                        sx={{ mr: 2 }}
                        onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => addItem(name, itemQuantity)}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: "0px 0px 20px rgba(0, 255, 191, 0.7)",
                            color: "#ffffff",
                          },
                          transition: "all 0.3s ease-in-out",
                          borderRadius: 2,
                          mr: 2,
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeItem(name, itemQuantity)}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.error.main,
                            boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.7)",
                            color: "#ffffff",
                          },
                          transition: "all 0.3s ease-in-out",
                          borderRadius: 2,
                          mr: 2,
                        }}
                      >
                        Remove
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setItemToDelete(name);
                          setDialogOpen(true);
                        }}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.error.main,
                            boxShadow: "0px 0px 20px rgba(255, 0, 0, 0.7)",
                            color: "#ffffff",
                          },
                          transition: "all 0.3s ease-in-out",
                          borderRadius: 2,
                        }}
                      >
                        <DeleteIcon />
                      </IconButton> 
                    </Stack>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
