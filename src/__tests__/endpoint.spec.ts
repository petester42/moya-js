import { Endpoint, EndpointSampleResponse } from "../endpoint";
import { GitHub, url } from "./test-helpers";
import { RequestPlainTask, Task } from "../task";
import { Method } from "../method";
import { TargetType } from "../target-type";
import { MoyaError } from "../moya-error";

// final class NonUpdatingRequestEndpointConfiguration: QuickConfiguration {
//     override static func configure(_ configuration: Configuration) {
//         sharedExamples("endpoint with no request property changed") { (context: SharedExampleContext) in
//             let task = context()["task"] as! Task
//             let oldEndpoint = context()["endpoint"] as! Endpoint<GitHub>
//             let endpoint = oldEndpoint.replacing(task: task)
//             let request = try! endpoint.urlRequest()

//             it("didn't update any of the request properties") {
//                 expect(request.httpBody).to(beNil())
//                 expect(request.url?.absoluteString).to(equal(endpoint.url))
//                 expect(request.allHTTPHeaderFields).to(equal(endpoint.httpHeaderFields))
//                 expect(request.httpMethod).to(equal(endpoint.method.rawValue))
//             }
//         }
//     }
// }

// final class ParametersEncodedEndpointConfiguration: QuickConfiguration {
//     override static func configure(_ configuration: Configuration) {
//         sharedExamples("endpoint with encoded parameters") { (context: SharedExampleContext) in
//             let parameters = context()["parameters"] as! [String: Any]
//             let encoding = context()["encoding"] as! ParameterEncoding
//             let endpoint = context()["endpoint"] as! Endpoint<GitHub>
//             let request = try! endpoint.urlRequest()

//             it("updated the request correctly") {
//                 let newEndpoint = endpoint.replacing(task: .requestPlain)
//                 let newRequest = try! newEndpoint.urlRequest()
//                 let newEncodedRequest = try? encoding.encode(newRequest, with: parameters)

//                 expect(request.httpBody).to(equal(newEncodedRequest?.httpBody))
//                 expect(request.url?.absoluteString).to(equal(newEncodedRequest?.url?.absoluteString))
//                 expect(request.allHTTPHeaderFields).to(equal(newEncodedRequest?.allHTTPHeaderFields))
//                 expect(request.httpMethod).to(equal(newEncodedRequest?.httpMethod))
//             }
//         }
//     }
// }

function simpleGitHubEndpoint(): Endpoint<GitHub> {
  let target: GitHub = GitHub.zen;
  let headerFields = new Map<string, string>();
  headerFields.set("Title", "Dominar");

  return new Endpoint<GitHub>(
    url(target),
    () => EndpointSampleResponse.networkResponse(200, target.sampleData),
    Method.Get,
    new RequestPlainTask(),
    headerFields
  );
}

describe("EndpointSpec", () => {
  let endpoint: Endpoint<GitHub>;

  beforeEach(() => {
    endpoint = simpleGitHubEndpoint();
  });

  it("returns a new endpoint for adding(newHTTPHeaderFields:)", () => {
    let agent = "Zalbinian";
    let headers = new Map<string, string>();
    headers.set("User-Agent", agent);

    let newEndpoint = endpoint.adding(headers);

    let newEndpointAgent =
      newEndpoint.httpHeaderFields === undefined ? undefined : newEndpoint.httpHeaderFields.get("User-Agent");

    // Make sure our closure updated the sample response, as proof that it can modify the Endpoint
    expect(newEndpointAgent).toEqual(agent);

    // Compare other properties to ensure they've been copied correctly
    expect(newEndpoint.url).toEqual(endpoint.url);
    expect(newEndpoint.method).toEqual(endpoint.method);
  });

  it("returns a nil urlRequest for an invalid URL", () => {
    let badUrl = "some invalid URL";
    let badEndpoint = new Endpoint<Empty>(
      badUrl,
      () => EndpointSampleResponse.networkResponse(200, new Blob()),
      Method.Get,
      new RequestPlainTask(),
      undefined
    );

    expect(() => badEndpoint.urlRequest()).toThrowError(MoyaError.requestMapping(badUrl).message);
  });

  // describe("successful converting to urlRequest") {
  //     context("when task is .requestPlain") {
  //         itBehavesLike("endpoint with no request property changed") {
  //             return ["task": Task.requestPlain, "endpoint": self.simpleGitHubEndpoint]
  //         }
  //     }

  //     context("when task is .uploadFile") {
  //         itBehavesLike("endpoint with no request property changed") {
  //             return ["task": Task.uploadFile(URL(string: "https://google.com")!), "endpoint": self.simpleGitHubEndpoint]
  //         }
  //     }

  //     context("when task is .uploadMultipart") {
  //         itBehavesLike("endpoint with no request property changed") {
  //             return ["task": Task.uploadMultipart([]), "endpoint": self.simpleGitHubEndpoint]
  //         }
  //     }

  //     context("when task is .downloadDestination") {
  //         itBehavesLike("endpoint with no request property changed") {
  //             let destination: DownloadDestination = { url, response in
  //                 return (destinationURL: url, options: [])
  //             }
  //             return ["task": Task.downloadDestination(destination), "endpoint": self.simpleGitHubEndpoint]
  //         }
  //     }

  //     context("when task is .requestParameters") {
  //         itBehavesLike("endpoint with encoded parameters") {
  //             let parameters = ["Nemesis": "Harvey"]
  //             let encoding = JSONEncoding.default
  //             let endpoint = self.simpleGitHubEndpoint.replacing(task: .requestParameters(parameters: parameters, encoding: encoding))
  //             return ["parameters": parameters, "encoding": encoding, "endpoint": endpoint]
  //         }
  //     }

  //     context("when task is .downloadParameters") {
  //         itBehavesLike("endpoint with encoded parameters") {
  //             let parameters = ["Nemesis": "Harvey"]
  //             let encoding = JSONEncoding.default
  //             let destination: DownloadDestination = { url, response in
  //                 return (destinationURL: url, options: [])
  //             }
  //             let endpoint = self.simpleGitHubEndpoint.replacing(task: .downloadParameters(parameters: parameters, encoding: encoding, destination: destination))
  //             return ["parameters": parameters, "encoding": encoding, "endpoint": endpoint]
  //         }
  //     }

  //     context("when task is .requestData") {
  //         var data: Data!
  //         var request: URLRequest!

  //         beforeEach {
  //             data = "test data".data(using: .utf8)
  //             endpoint = endpoint.replacing(task: .requestData(data))
  //             request = try! endpoint.urlRequest()
  //         }

  //         it("updates httpBody") {
  //             expect(request.httpBody).to(equal(data))
  //         }

  //         it("doesn't update any of the other properties") {
  //             expect(request.url?.absoluteString).to(equal(endpoint.url))
  //             expect(request.allHTTPHeaderFields).to(equal(endpoint.httpHeaderFields))
  //             expect(request.httpMethod).to(equal(endpoint.method.rawValue))
  //         }
  //     }

  //     context("when task is .requestJSONEncodable") {
  //         var issue: Issue!
  //         var request: URLRequest!

  //         beforeEach {
  //             issue = Issue(title: "Hello, Moya!", createdAt: Date())
  //             endpoint = endpoint.replacing(task: .requestJSONEncodable(issue))
  //             request = try! endpoint.urlRequest()
  //         }

  //         it("updates httpBody") {
  //             let expectedIssue = try! JSONDecoder().decode(Issue.self, from: request.httpBody!)
  //             expect(issue.createdAt).to(equal(expectedIssue.createdAt))
  //             expect(issue.title).to(equal(expectedIssue.title))
  //         }

  //         it("updates headers to include Content-Type: application/json") {
  //             let contentTypeHeaders = ["Content-Type": "application/json"]
  //             let initialHeaderFields = endpoint.httpHeaderFields ?? [:]
  //             let expectedHTTPHeaderFields = initialHeaderFields.merging(contentTypeHeaders) { initialValue, _ in initialValue }
  //             expect(request.allHTTPHeaderFields).to(equal(expectedHTTPHeaderFields))
  //         }

  //         it("doesn't update any of the other properties") {
  //             expect(request.url?.absoluteString).to(equal(endpoint.url))
  //             expect(request.httpMethod).to(equal(endpoint.method.rawValue))
  //         }
  //     }

  //     context("when task is .requestCompositeData") {
  //         var parameters: [String: Any]!
  //         var data: Data!
  //         var request: URLRequest!

  //         beforeEach {
  //             parameters = ["Nemesis": "Harvey"]
  //             data = "test data".data(using: .utf8)
  //             endpoint = endpoint.replacing(task: .requestCompositeData(bodyData: data, urlParameters: parameters))
  //             request = try! endpoint.urlRequest()
  //         }

  //         it("updates url") {
  //             let expectedUrl = endpoint.url + "?Nemesis=Harvey"
  //             expect(request.url?.absoluteString).to(equal(expectedUrl))
  //         }

  //         it("updates httpBody") {
  //             expect(request.httpBody).to(equal(data))
  //         }

  //         it("doesn't update any of the other properties") {
  //             expect(request?.allHTTPHeaderFields).to(equal(endpoint.httpHeaderFields))
  //             expect(request?.httpMethod).to(equal(endpoint.method.rawValue))
  //         }
  //     }

  //     context("when task is .requestCompositeParameters") {
  //         var bodyParameters: [String: Any]!
  //         var urlParameters: [String: Any]!
  //         var encoding: ParameterEncoding!
  //         var request: URLRequest!

  //         beforeEach {
  //             bodyParameters = ["Nemesis": "Harvey"]
  //             urlParameters = ["Harvey": "Nemesis"]
  //             encoding = JSONEncoding.default
  //             endpoint = endpoint.replacing(task: .requestCompositeParameters(bodyParameters: bodyParameters, bodyEncoding: encoding, urlParameters: urlParameters))
  //             request = try! endpoint.urlRequest()
  //         }

  //         it("updates url") {
  //             let expectedUrl = endpoint.url + "?Harvey=Nemesis"
  //             expect(request.url?.absoluteString).to(equal(expectedUrl))
  //         }

  //         it("updates the request correctly") {
  //             let newEndpoint = endpoint.replacing(task: .requestPlain)
  //             let newRequest = try! newEndpoint.urlRequest()
  //             let newEncodedRequest = try? encoding.encode(newRequest, with: bodyParameters)

  //             expect(request.httpBody).to(equal(newEncodedRequest?.httpBody))
  //             expect(request.allHTTPHeaderFields).to(equal(newEncodedRequest?.allHTTPHeaderFields))
  //             expect(request.httpMethod).to(equal(newEncodedRequest?.httpMethod))
  //         }
  //     }

  //     context("when task is .uploadCompositeMultipart") {
  //         var urlParameters: [String: Any]!
  //         var request: URLRequest!

  //         beforeEach {
  //             urlParameters = ["Harvey": "Nemesis"]
  //             endpoint = endpoint.replacing(task: .uploadCompositeMultipart([], urlParameters: urlParameters))
  //             request = try! endpoint.urlRequest()
  //         }

  //         it("updates url") {
  //             let expectedUrl = endpoint.url + "?Harvey=Nemesis"
  //             expect(request.url?.absoluteString).to(equal(expectedUrl))
  //         }
  //     }
  // }

  // describe("unsuccessful converting to urlRequest") {
  //     context("when url String is invalid") {
  //         it("throws a .requestMapping error") {
  //             let badEndpoint = Endpoint<Empty>(url: "some invalid URL", sampleResponseClosure: { .networkResponse(200, Data()) }, method: .get, task: .requestPlain, httpHeaderFields: nil)
  //             let expectedError = MoyaError.requestMapping("some invalid URL")
  //             var recievedError: MoyaError?
  //             do {
  //                 _ = try badEndpoint.urlRequest()
  //             } catch {
  //                 recievedError = error as? MoyaError
  //             }
  //             expect(recievedError).toNot(beNil())
  //             expect(recievedError).to(beOfSameErrorType(expectedError))
  //         }
  //     }

  //     context("when parameter encoding is unsuccessful") {
  //         it("throws a .parameterEncoding error") {

  //             // Non-serializable type to cause serialization error
  //             class InvalidParameter {}

  //             endpoint = endpoint.replacing(task: .requestParameters(parameters: ["":InvalidParameter()], encoding: PropertyListEncoding.default))
  //             let cocoaError = NSError(domain: "NSCocoaErrorDomain", code: 3851, userInfo: ["NSDebugDescription":"Property list invalid for format: 100 (property lists cannot contain objects of type 'CFType')"])
  //             let expectedError = MoyaError.parameterEncoding(cocoaError)
  //             var recievedError: MoyaError?

  //             do {
  //                 _ = try endpoint.urlRequest()
  //             } catch {
  //                 recievedError = error as? MoyaError
  //             }
  //             expect(recievedError).toNot(beNil())
  //             expect(recievedError).to(beOfSameErrorType(expectedError))
  //         }
  //     }

  //     context("when task is .requestCompositeParameters") {
  //         it("throws an error when bodyEncoding is an URLEncoding") {
  //             endpoint = endpoint.replacing(task: .requestCompositeParameters(bodyParameters: [:], bodyEncoding: URLEncoding.queryString, urlParameters: [:]))
  //             expect { _ = try? endpoint.urlRequest() }.to(throwAssertion())
  //         }
  //     }
  // }
  // }
});

class Empty implements TargetType {
  // None of these matter since the Empty has no cases and can't be instantiated.
  get baseURL(): URL {
    return new URL("http://example.com")!;
  }

  get path(): string {
    return "";
  }

  get method(): Method {
    return Method.Get;
  }

  get task(): Task {
    return new RequestPlainTask();
  }

  get sampleData(): Blob {
    return new Blob();
  }

  get headers(): Map<string, string> | undefined {
    return undefined;
  }
}
