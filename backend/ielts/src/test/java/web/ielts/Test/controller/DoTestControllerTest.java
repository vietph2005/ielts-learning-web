package web.ielts.Test.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import web.ielts.Test.dotest.controller.DoTestController;
import web.ielts.Test.dotest.model.Writing;
import web.ielts.Test.dotest.service.WritingTestService;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DoTestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WritingTestService writingTestService;

    @InjectMocks
    private DoTestController doTestController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(doTestController).build();
    }

    @Test
    void getWritingByTestId() throws Exception {
        Writing writing = new Writing();
        writing.setTestId("T001");

        when(writingTestService.getWritingByTestId("T001")).thenReturn(Optional.of(writing));

        mockMvc.perform(get("/tests/T001/writing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.testId").value("T001"));
    }
}