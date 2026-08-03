package web.ielts.Report.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Report.model.Report;

public interface ReportRepository extends MongoRepository<Report, String> {
}
