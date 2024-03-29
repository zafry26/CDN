﻿import { createSlice } from "@reduxjs/toolkit";
import PersonService from "@Services/PersonService";

// Create the slice.
const slice = createSlice({
  name: "person",
  initialState: {
    isFetching: false,
    collection: [],
  },
  reducers: {
    setFetching: (state, action) => {
      state.isFetching = action.payload;
    },
    setData: (state, action) => {
      state.collection = action.payload;
    },
    addData: (state, action) => {
      state.collection = [...state.collection, action.payload];
    },
    updateData: (state, action) => {
      // We need to clone collection (Redux-way).
      var collection = [...state.collection];

      var entry = collection.find((x) => x.id === action.payload.id);
      entry.username = action.payload.username;
      entry.email = action.payload.email;
      entry.phoneNumber = action.payload.phoneNumber;
      entry.skillsets = action.payload.skillsets;
      entry.hobby = action.payload.hobby;

      state.collection = [...state.collection];
    },
    deleteData: (state, action) => {
      state.collection = state.collection.filter(
        (x) => x.id !== action.payload.id
      );
    },
  },
});

// Export reducer from the slice.
export const { reducer } = slice;

// Define action creators.
export const actionCreators = {
  search:
    (term = null) =>
    async (dispatch) => {
      dispatch(slice.actions.setFetching(true));

      const service = new PersonService();

      const result = await service.search(term);

      console.log(result);

      if (!result.hasErrors) {
        dispatch(slice.actions.setData(result.value));
      }

      dispatch(slice.actions.setFetching(false));

      return result;
    },
  add: (model) => async (dispatch) => {
    dispatch(slice.actions.setFetching(true));

    const service = new PersonService();

    const result = await service.add(model);

    if (!result.hasErrors) {
      model.id = result.value.id;
      dispatch(slice.actions.addData(model));
    }

    dispatch(slice.actions.setFetching(false));

    return result;
  },
  update: (model) => async (dispatch) => {
    dispatch(slice.actions.setFetching(true));

    const service = new PersonService();

    const result = await service.update(model);

    if (!result.hasErrors) {
      dispatch(slice.actions.updateData(model));
    }

    dispatch(slice.actions.setFetching(false));

    return result;
  },
  delete: (id) => async (dispatch) => {
    dispatch(slice.actions.setFetching(true));

    const service = new PersonService();

    const result = await service.delete(id);

    if (!result.hasErrors) {
      dispatch(slice.actions.deleteData({ id }));
    }

    dispatch(slice.actions.setFetching(false));

    return result;
  },
};
