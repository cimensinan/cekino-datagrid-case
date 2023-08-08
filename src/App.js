import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Pagination,
  Spinner,
  Table,
} from "react-bootstrap";
import { BsSearch, BsPlus, BsPencil, BsTrash } from "react-icons/bs";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import "moment/locale/tr";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "./App.scss";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditButtonDisabled, setIsEditButtonDisabled] = useState(true);
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const initialValues = {
    anahtarKelime: "",
    aciklama: "",
  };

  const [editInitialValues, setEditInitialValues] = useState({
    anahtarKelime: "",
    aciklama: "",
  });

  const validationSchema = Yup.object({
    anahtarKelime: Yup.string()
      .min(3, "Lütfen en az 3 karakter giriniz")
      .required("Lütfen bir anahtar kelime giriniz"),
    aciklama: Yup.string()
      .min(3, "Lütfen en az 3 karakter giriniz")
      .required("Lütfen bir açıklama giriniz"),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const timestamp = moment().format();
      setDataList((prevDataList) => [
        { ...values, timestamp },
        ...prevDataList,
      ]);
      formik.resetForm();
      toast.success("Veri başarıyla eklendi.", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (err) {
      console.log("Veri eklenirken bir hata oluştu.", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const onEditSubmit = async (values) => {
    setLoading(true);
    try {
      const timestamp = moment().format();
      const updatedDataList = dataList.map((data, index) =>
        index === selectedRowIndex ? { ...values, timestamp } : data
      );
      setDataList(updatedDataList);
      editFormik.resetForm();
      toast.success("Veri başarıyla güncellendi.", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (err) {
      console.log("Veri güncellenirken bir hata oluştu.", err);
    } finally {
      setLoading(false);
      setShowEditModal(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const editFormik = useFormik({
    initialValues: editInitialValues,
    validationSchema,
    onSubmit: onEditSubmit,
  });

  const handleEdit = () => {
    if (selectedRowIndex !== -1) {
      const selectedRow = dataList[selectedRowIndex];
      setEditInitialValues({
        anahtarKelime: selectedRow.anahtarKelime,
        aciklama: selectedRow.aciklama,
      });
      editFormik.setValues({
        anahtarKelime: selectedRow.anahtarKelime,
        aciklama: selectedRow.aciklama,
      });
      setShowEditModal(true);
    }
  };

  const handleDelete = () => {
    if (selectedRowIndex !== -1) {
      Swal.fire({
        title: "Veriyi Sil",
        text: "Bu veriyi silmek istediğinizden emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2052cc",
        cancelButtonColor: "#d33",
        confirmButtonText: "Evet",
        cancelButtonText: "Vazgeç",
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedDataList = dataList.filter(
            (_, index) => index !== selectedRowIndex
          );
          setDataList(updatedDataList);
          setSelectedRowIndex(-1);

          toast.success("Veri başarıyla silindi.", {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
        }
      });
    }
  };

  useEffect(() => {
    setIsEditButtonDisabled(selectedRowIndex === -1);
    setIsDeleteButtonDisabled(selectedRowIndex === -1);
  }, [selectedRowIndex]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchText(searchQuery);
  };

  return (
    <main className="tableCase">
      <div className="d-flex justify-content-between mb-3 header">
        <div className="searchBox">
          <InputGroup>
            <FormControl
              placeholder="Ara"
              value={searchText}
              onChange={handleSearch}
            />
            <Button variant="light">
              <BsSearch />
            </Button>
          </InputGroup>
        </div>
        <div className="d-flex justify-content-between gap-2 btns-group">
          <div>
            {dataList.length > 0 && (
              <span>
                Toplam: {dataList.length} Kayıt {"-"} {startIndex + 1} ile{" "}
                {Math.min(endIndex, dataList.length)}
              </span>
            )}
          </div>
          <div className="d-flex justify-content-between gap-2">
            <Button variant="success" onClick={() => setShowModal(true)}>
              <BsPlus /> Yeni Ekle
            </Button>
            <Button
              variant="info"
              onClick={handleEdit}
              disabled={isEditButtonDisabled}
            >
              <BsPencil /> Düzenle
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleteButtonDisabled}
            >
              <BsTrash /> Sil
            </Button>
          </div>
        </div>
      </div>
      <Table striped borderless hover responsive>
        <thead style={{ verticalAlign: "middle" }}>
          <tr>
            <th></th>
            <th>Sıra No</th>
            <th>Anahtar Kelime</th>
            <th>Açıklama</th>
            <th>Oluşturulma/Güncelleme Zamanı</th>
          </tr>
        </thead>
        <tbody>
          {dataList.slice(startIndex, endIndex).map((data, index) =>
            searchText === "" ||
            data.anahtarKelime.toLowerCase().includes(searchText) ||
            data.aciklama.toLowerCase().includes(searchText) ? (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={index === selectedRowIndex}
                    onChange={() => {
                      if (index === selectedRowIndex) {
                        setSelectedRowIndex(-1);
                      } else {
                        setSelectedRowIndex(index);
                      }
                    }}
                  />
                </td>
                <td>{dataList.length - (startIndex + index)}</td>
                <td>{data.anahtarKelime}</td>
                <td>{data.aciklama}</td>
                <td>{moment(data.timestamp).format("DD MMM, HH:mm:ss")}</td>
              </tr>
            ) : null
          )}
        </tbody>
      </Table>
      {dataList.length > itemsPerPage && (
        <div className="d-flex justify-content-end align-items-center pagination-div">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            <Pagination.Item>
              Sayfa {currentPage} - Toplam{" "}
              {Math.ceil(dataList.length / itemsPerPage)}
            </Pagination.Item>
            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={
                currentPage === Math.ceil(dataList.length / itemsPerPage)
              }
            />
            <Pagination.Last
              onClick={() =>
                setCurrentPage(Math.ceil(dataList.length / itemsPerPage))
              }
              disabled={
                currentPage === Math.ceil(dataList.length / itemsPerPage)
              }
            />
          </Pagination>
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Veri Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate onSubmit={formik.handleSubmit}>
            <Form.Group>
              <Form.Label>Anahtar Kelime</Form.Label>
              <Form.Control
                type="text"
                placeholder="Anahtar kelime girin"
                {...formik.getFieldProps("anahtarKelime")}
                isInvalid={
                  formik.touched.anahtarKelime && formik.errors.anahtarKelime
                }
                isValid={
                  formik.touched.anahtarKelime && !formik.errors.anahtarKelime
                }
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.anahtarKelime}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                type="text"
                placeholder="Açıklama girin"
                {...formik.getFieldProps("aciklama")}
                isInvalid={formik.touched.aciklama && formik.errors.aciklama}
                isValid={formik.touched.aciklama && !formik.errors.aciklama}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.aciklama}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer>
              <Button variant="danger" onClick={() => setShowModal(false)}>
                Kapat
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!(formik.dirty && formik.isValid) || loading}
              >
                {loading && <Spinner animation="border" size="sm" />} Kaydet
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Veri Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate onSubmit={editFormik.handleSubmit}>
            <Form.Group>
              <Form.Label>Anahtar Kelime</Form.Label>
              <Form.Control
                type="text"
                {...editFormik.getFieldProps("anahtarKelime")}
                isInvalid={
                  editFormik.touched.anahtarKelime &&
                  editFormik.errors.anahtarKelime
                }
                isValid={
                  editFormik.touched.anahtarKelime &&
                  !editFormik.errors.anahtarKelime
                }
              />
              <Form.Control.Feedback type="invalid">
                {editFormik.errors.anahtarKelime}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                type="text"
                {...editFormik.getFieldProps("aciklama")}
                isInvalid={
                  editFormik.touched.aciklama && editFormik.errors.aciklama
                }
                isValid={
                  editFormik.touched.aciklama && !editFormik.errors.aciklama
                }
              />
              <Form.Control.Feedback type="invalid">
                {editFormik.errors.aciklama}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer>
              <Button variant="danger" onClick={() => setShowEditModal(false)}>
                Kapat
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!(editFormik.dirty && editFormik.isValid) || loading}
              >
                {loading && <Spinner animation="border" size="sm" />} Güncelle
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer autoClose={1000} />
    </main>
  );
};

export default App;