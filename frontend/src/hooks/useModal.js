import { useState, useCallback } from "react";

/*
  Keeps track of modal props. Returns current modalProps and toggleModal function
  which takes (type, data) parameters. Type is the modal type that should be 
  displayed and data is additional props that should be passed to the modal.

  Calling toggleModal() with no parameters resets the modalProps so the current
  modal will be hidden.
*/

const initialModalState = {
  centered: false,
  show: false,
  type: null,
};

const useModal = () => {
  const [modalProps, setModalProps] = useState(initialModalState);
  const toggleModal = useCallback((type, props) => {
    if (type !== undefined) {
      setModalProps({
        ...initialModalState,
        ...props,
        show: true,
        type: type,
        onHide: () => {
          if (props.onHide) props.onHide();
          toggleModal();
        },
      });
    } else {
      /* 
          When toggling the modal off, we don't want to reset the type variable
          since we still want that modal to be rendered (so the Bootstrap modal hide animation has time to be shown)
        */
      setModalProps((prevState) => ({
        // Keep the previous state (except for 'show') so props persist throughout modal close animation
        ...prevState,
        show: false,
        type: prevState.type,
      }));
    }
  }, []);

  return [modalProps, toggleModal];
};

export default useModal;
